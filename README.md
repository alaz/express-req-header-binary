# Node HTTP server bug

Binary data in a request header value results in Node's HTTP server silently dropping this connection.

Behavior under Node versions:

* 8.15.1: bug
* 10.15.2: fixed

# Steps to reproduce

Prerequisites:

* curl
* Nginx
* Node.js

Setup:

* `yarn`

Run Express (at port 8080):

```
yarn run express
```

or run vanilla Node's HTTP server: `yarn run http`

Run Nginx in another terminal (port 8000):

```
yarn run nginx
```

# Testing

```
Alaz-Laptop:~ alaz$ curl -i http://localhost:8000/no_header
HTTP/1.1 204 No Content
Server: nginx/1.15.12
Date: Mon, 22 Apr 2019 08:51:54 GMT
Connection: keep-alive
X-Powered-By: Express

Alaz-Laptop:~ alaz$ curl -i http://localhost:8000/bin_header
HTTP/1.1 502 Bad Gateway
Server: nginx/1.15.12
Date: Mon, 22 Apr 2019 08:51:59 GMT
Content-Type: text/html
Content-Length: 158
Connection: keep-alive

<html>
<head><title>502 Bad Gateway</title></head>
<body>
<center><h1>502 Bad Gateway</h1></center>
<hr><center>nginx/1.15.12</center>
</body>
</html>
```

Look at the terminal where Nginx is running:

```
2019/04/22 12:32:20 [error] 57078#0: *1 upstream prematurely closed connection while reading response header from upstream, client: 127.0.0.1, server: _, request: "GET /bin_header HTTP/1.1", upstream: "http://127.0.0.1:8080/", host: "localhost:8000"
2019/04/22 12:32:20 [warn] 57078#0: *1 upstream server temporarily disabled while reading response header from upstream, client: 127.0.0.1, server: _, request: "GET /bin_header HTTP/1.1", upstream: "http://127.0.0.1:8080/", host: "localhost:8000"
```

# Details

Both Nginx locations `/no_header` and `/bin_header` proxy to the Express/Node application's same path. But Nginx sets a request header with binary value when called as `/bin_header`. Node server writes nothing to the log and silently drops the connection.

This is incorrect behavior, Web servers should accept any requests and reply with meaningful responses. This could be a security issue as well: if a load balancer sees too many dropped upstream connections, it will mark the upstream host as down. What if it marks all the hosts as down? For example, try fetching `/bin_header` and then immediately `/no_header` - you will see that Nginx still returns `502`, because it has disabled the upstream.
