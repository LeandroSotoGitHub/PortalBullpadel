import http.server
import os
import sys

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    elif os.environ.get('PORT'):
        port = int(os.environ['PORT'])
    else:
        port = 8531
    http.server.test(HandlerClass=NoCacheHandler, port=port)
