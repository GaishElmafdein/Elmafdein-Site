import socket
with socket.socket() as s:
    s.bind(('127.0.0.1', 8022))
    print('BIND_OK')
