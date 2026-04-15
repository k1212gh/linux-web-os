"""
WebSocket terminal using pty — real bash session in the browser.
"""
import asyncio
import json
import os
import pty
import signal
import struct
import fcntl
import termios

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


@router.websocket("/terminal")
async def terminal_ws(websocket: WebSocket):
    await websocket.accept()

    pid, fd = pty.fork()

    if pid == 0:
        shell = os.environ.get("SHELL", "/bin/bash")
        env = {
            **os.environ,
            "TERM": "xterm-256color",
            "COLORTERM": "truecolor",
            "LANG": "en_US.UTF-8",
        }
        os.execvpe(shell, [shell, "--login"], env)
        return

    loop = asyncio.get_event_loop()
    queue: asyncio.Queue = asyncio.Queue()

    def _on_readable():
        try:
            data = os.read(fd, 4096)
        except OSError:
            queue.put_nowait(None)
            return
        if not data:
            queue.put_nowait(None)
            return
        queue.put_nowait(data)

    loop.add_reader(fd, _on_readable)

    async def pty_to_ws():
        while True:
            data = await queue.get()
            if data is None:
                break
            await websocket.send_text(data.decode("utf-8", errors="replace"))

    async def ws_to_pty():
        async for raw in websocket.iter_text():
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue
            try:
                if msg.get("type") == "input":
                    os.write(fd, msg["data"].encode())
                elif msg.get("type") == "resize":
                    cols = int(msg.get("cols", 80))
                    rows = int(msg.get("rows", 24))
                    winsize = struct.pack("HHHH", rows, cols, 0, 0)
                    fcntl.ioctl(fd, termios.TIOCSWINSZ, winsize)
            except (KeyError, OSError, ValueError):
                continue

    try:
        done, pending = await asyncio.wait(
            {asyncio.create_task(pty_to_ws()), asyncio.create_task(ws_to_pty())},
            return_when=asyncio.FIRST_COMPLETED,
        )
        for t in pending:
            t.cancel()
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        try:
            loop.remove_reader(fd)
        except Exception:
            pass
        # Graceful: SIGHUP → SIGTERM → SIGKILL
        try:
            os.kill(pid, signal.SIGHUP)
        except OSError:
            pass
        try:
            for _ in range(10):  # ~1s
                wpid, _status = os.waitpid(pid, os.WNOHANG)
                if wpid != 0:
                    break
                await asyncio.sleep(0.1)
            else:
                os.kill(pid, signal.SIGKILL)
                os.waitpid(pid, 0)
        except (OSError, ChildProcessError):
            pass
        try:
            os.close(fd)
        except OSError:
            pass
