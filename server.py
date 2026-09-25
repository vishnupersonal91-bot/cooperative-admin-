import http.server
import socketserver
import os
import sys

class CleanStaticServer(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def guess_type(self, path):
        if path.endswith('.js'):
            return 'text/javascript; charset=utf-8'
        if path.endswith('.css'):
            return 'text/css; charset=utf-8'
        if path.endswith('.html'):
            return 'text/html; charset=utf-8'
        return super().guess_type(path)

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == '__main__':
    port = 8080
    host = '0.0.0.0'
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f"Starting Clean Static Server on http://localhost:{port} (working dir: {os.getcwd()})")
    server = ThreadedHTTPServer((host, port), CleanStaticServer)
    server.serve_forever()
