"""
Claude Code session manager.
Spawns and manages `claude` CLI processes via PTY.
"""
import os
import pty
import json
import asyncio
import signal
import select
import uuid
from datetime import datetime


class ClaudeSession:
    def __init__(self, session_id: str, project_dir: str):
        self.id = session_id
        self.project_dir = project_dir
        self.pid = None
        self.fd = None
        self.started_at = datetime.now().isoformat()
        self.messages = []
        self._running = False

    async def start(self):
        """Spawn claude process with PTY."""
        env = os.environ.copy()
        env["TERM"] = "xterm-256color"
        env["COLORTERM"] = "truecolor"

        pid, fd = pty.fork()
        if pid == 0:
            # Child process
            os.chdir(self.project_dir)
            os.execvpe(
                "claude",
                ["claude", "--json"],
                env,
            )
        else:
            # Parent
            self.pid = pid
            self.fd = fd
            self._running = True

    async def send_input(self, text: str):
        """Send user input to claude process."""
        if self.fd is None:
            return
        os.write(self.fd, (text + "\n").encode())

    async def read_output(self) -> str | None:
        """Non-blocking read from PTY."""
        if self.fd is None:
            return None
        try:
            r, _, _ = select.select([self.fd], [], [], 0.05)
            if r:
                data = os.read(self.fd, 4096)
                if data:
                    return data.decode("utf-8", errors="replace")
        except OSError:
            self._running = False
        return None

    async def stop(self):
        """Terminate claude process."""
        self._running = False
        if self.pid:
            try:
                os.kill(self.pid, signal.SIGTERM)
                await asyncio.sleep(0.5)
                os.kill(self.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
        if self.fd:
            try:
                os.close(self.fd)
            except OSError:
                pass
        self.pid = None
        self.fd = None

    @property
    def is_running(self):
        return self._running and self.pid is not None

    def to_dict(self):
        return {
            "id": self.id,
            "project_dir": self.project_dir,
            "started_at": self.started_at,
            "is_running": self.is_running,
            "message_count": len(self.messages),
        }


class SessionManager:
    """Manages multiple Claude sessions."""

    def __init__(self):
        self.sessions: dict[str, ClaudeSession] = {}

    async def create(self, project_dir: str) -> ClaudeSession:
        session_id = str(uuid.uuid4())[:8]
        session = ClaudeSession(session_id, project_dir)
        await session.start()
        self.sessions[session_id] = session
        return session

    def get(self, session_id: str) -> ClaudeSession | None:
        return self.sessions.get(session_id)

    async def remove(self, session_id: str):
        session = self.sessions.pop(session_id, None)
        if session:
            await session.stop()

    def list_all(self):
        return [s.to_dict() for s in self.sessions.values()]

    async def cleanup(self):
        for sid in list(self.sessions.keys()):
            await self.remove(sid)


# Singleton
session_manager = SessionManager()
