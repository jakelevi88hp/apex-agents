from http.server import BaseHTTPRequestHandler
import json
import sys
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Collect diagnostic information
            diagnostics = {
                "python_version": sys.version,
                "current_dir": os.getcwd(),
                "file_location": __file__,
                "sys_path": sys.path[:10],  # First 10 paths
                "env_vars": {k: v for k, v in os.environ.items() if 'VERCEL' in k or 'PYTHON' in k},
            }
            
            # Try to locate src/lib/agi
            project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            src_lib_path = os.path.join(project_root, 'src', 'lib')
            agi_path = os.path.join(src_lib_path, 'agi')
            
            diagnostics["project_root"] = project_root
            diagnostics["src_lib_path"] = src_lib_path
            diagnostics["agi_path"] = agi_path
            diagnostics["src_lib_exists"] = os.path.exists(src_lib_path)
            diagnostics["agi_exists"] = os.path.exists(agi_path)
            
            if os.path.exists(agi_path):
                diagnostics["agi_files"] = os.listdir(agi_path)[:20]
            
            # Try importing
            sys.path.insert(0, src_lib_path)
            import_error = None
            try:
                from agi.core import AGICore
                diagnostics["agi_import_success"] = True
                diagnostics["agi_core_location"] = AGICore.__module__
            except Exception as e:
                diagnostics["agi_import_success"] = False
                diagnostics["agi_import_error"] = str(e)
                import_error = e
                
                # Try to get more details
                try:
                    import traceback
                    diagnostics["agi_import_traceback"] = traceback.format_exc()
                except:
                    pass
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(diagnostics, indent=2).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

