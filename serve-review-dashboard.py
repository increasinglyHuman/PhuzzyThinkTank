#!/usr/bin/env python3
"""
Simple HTTP server for the Phuzzy Review Dashboard
Serves files with proper CORS headers for local development
"""

import http.server
import socketserver
import os
import sys

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def main():
    PORT = 8080
    
    # Change to the script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print(f"🎭 Phuzzy Review Dashboard Server")
    print(f"==================================")
    print(f"Starting server on http://localhost:{PORT}")
    print(f"Open http://localhost:{PORT}/scenario-review-dashboard.html in your browser")
    print(f"\nPress Ctrl+C to stop the server")
    
    with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped.")
            sys.exit(0)

if __name__ == "__main__":
    main()