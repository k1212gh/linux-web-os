"""
WebSocket terminal using pty — real bash session in the browser.
"""
import asyncio
import json
import os
import pty
import select
import struct
import fcntl
import termios

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


@router.websocket("/terminal")
async def terminal_ws(websocket: WebSocket):
    await websocket.accept()

    # Spawn a real shell with PTY
    pid, fd = pty.fork()

    if pid == 0:
        # Child: exec shell
        shell = os.environ.get("SHELL", "/bin/bash")
        env = {
            **os.environ,
            "TERM": "xterm-256color",
            "COLORTERM": "truecolor",
            "LANG": "en_US.UTF-8",
        }
        os.execvpe(shell, [shell, "--login"], env)
    else:
        # Parent: relay between WebSocket and PTY fd
        loop = asyncio.get_event_loop()

        async def read_from_pty():
            while True:
                try:
                    await asyncio.sleep(0.01)
                    r, _, _ = select.select([fd], [], [], 0)
                    if r:
                        data = os.read(fd, 4096)
                        if not data:
                            break
                        await websocket.send_text(data.decode("utf-8", errors="replace"))
                except (OSError, EOFError):
                    break

        async def read_from_ws():
            async for raw in websocket.iter_text():
                try:
                    msg = json.loads(raw)
                    if msg["type"] == "input":
                        os.write(fd, msg["data"].encode())
                    elif msg["type"] == "resize":
                        cols = msg.get("cols", 80)
                        rows = msg.get("rows", 24)
                        winsize = struct.pack("HHHH", rows, cols, 0, 0)
                        fcntl.ioctl(fd, termios.TIOCSWINSZ, winsize)
                except (json.JSONDecodeError, KeyError, OSError):
                    pass

        try:
            await asyncio.gather(read_from_pty(), read_from_ws())
        except (WebSocketDisconnect, Exception):
            pass
        finally:
            try:
                os.kill(pid, 9)
                os.waitpid(pid, 0)
                os.close(fd)
            except OSError:
                pass
