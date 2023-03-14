var $gSYnN$http = require("http");
var $gSYnN$path = require("path");
var $gSYnN$fs = require("fs");
var $gSYnN$events = require("events");

/**
 * Created by Rick on 2021-08-29.
 */ var $9b6a791bf3448f12$var$__dirname = "src";
"use strict";




const $9b6a791bf3448f12$var$global_error_emitter = new $gSYnN$events();
$9b6a791bf3448f12$var$global_error_emitter.on("error", async (res, err)=>{
    err.statusCode = err.statusCode || 500;
    const content = {
        statusCode: err.statusCode,
        message: err.message
    };
    await $9b6a791bf3448f12$var$reply_response(res, content.statusCode, JSON.stringify(content), "application/json");
    if (err.stack !== undefined) console.log(err.stack);
});
class $9b6a791bf3448f12$var$HttpServer {
    constructor(host, port){
        this.host = host || undefined;
        this.port = port || parseInt(undefined);
        if (this.host === undefined) this.host = "127.0.0.1"; // default IPv4 loopback address to the local host
        if (isNaN(this.port)) this.port = 8080;
        this.base = [
            this.host,
            ":",
            this.port
        ].join("");
        this.server = $gSYnN$http.createServer();
        this.methods = {
            get: {},
            post: {},
            patch: {},
            delete: {}
        };
        this.current_route = "/";
        this.middlewares = {};
        this.static_dir = $9b6a791bf3448f12$var$__dirname;
        this.found_file_path = null;
        this.content_types = {
            ".html": "text/html",
            ".jpg": "image/jpeg",
            ".css": "text/css",
            ".js": "text/javascript",
            ".png": "imageg/png",
            ".ico": "image/x-icon",
            ".json": "application/json",
            ".svg": "image/svg+xml",
            ".svgz": "image/svg+xml"
        };
        this.server.on("request", this.callback);
    }
    callback = async (req, res)=>{
        const method = req.method.toLowerCase();
        // const url_parsed = url.parse(req.url, true);
        // let url_pathname = url_parsed.pathname;
        const url = new URL(req.url, "http:\\" + this.base);
        let url_pathname = url.pathname;
        // process middleware
        if (Object.keys(this.middlewares).length > 0) {
            //process middleware for '/' routes
            for (let fn of this.middlewares["/"])await fn(req, res);
            // process route specific middleware
            if (Object.keys(this.middlewares).includes(url_pathname)) for (let fn of this.middlewares[url_pathname])await fn(req, res);
        }
        switch(method){
            case "get":
                if (url_pathname in this.methods.get) this.methods.get[url_pathname](req, res);
                else if (this.static_dir !== null) {
                    url_pathname = url_pathname.replace("/", "");
                    const url_parts = url_pathname.split("/");
                    const target_file_name = url_parts[url_parts.length - 1];
                    this.found_file_path = null;
                    this._search_file(this.static_dir, target_file_name);
                    if (this.found_file_path !== null) {
                        const content = await this._read_file(this.found_file_path);
                        const content_type = this.content_types[$gSYnN$path.extname(this.found_file_path)];
                        await $9b6a791bf3448f12$var$reply_response(res, 200, content, content_type);
                    } else {
                        const err = {
                            statusCode: 404,
                            message: `Could not locate ${url_pathname} (get)`
                        };
                        $9b6a791bf3448f12$var$global_error_emitter.emit("error", res, err);
                    }
                } else {
                    const err = {
                        statusCode: 404,
                        message: `Could not locate ${url_pathname} (get)`
                    };
                    $9b6a791bf3448f12$var$global_error_emitter.emit("error", res, err);
                }
                break;
            case "post":
                if (url_pathname in this.methods.post) this.methods.post[url_pathname](req, res);
                else {
                    const err = {
                        statusCode: 404,
                        message: `Could not locate ${url_pathname} (post)`
                    };
                    $9b6a791bf3448f12$var$global_error_emitter.emit("error", res, err);
                }
                break;
            case "patch":
                if (url_pathname in this.methods.patch) this.methods.patch[url_pathname](req, res);
                else {
                    const err = {
                        statusCode: 404,
                        message: `Could not locate ${url_pathname} (patch)`
                    };
                    $9b6a791bf3448f12$var$global_error_emitter.emit("error", res, err);
                }
                break;
            case "delete":
                if (url_pathname in this.methods.delete) this.methods.delete[url_pathname](req, res);
                else {
                    const err = {
                        statusCode: 404,
                        message: `Could not locate ${url_pathname} (delete)`
                    };
                    $9b6a791bf3448f12$var$global_error_emitter.emit("error", res, err);
                }
                break;
            default:
                const err = {
                    statusCode: 400,
                    message: `Method ${method} is not supported.`
                };
                $9b6a791bf3448f12$var$global_error_emitter.emit("error", res, err);
                break;
        }
    };
    use({ route: route = "/" , middleware: middleware = ()=>{}  }) {
        if (!Object.keys(this.middlewares).includes(route)) this.middlewares[route] = [];
        this.middlewares[route].push(middleware);
    }
    route(a_route) {
        this.current_route = a_route;
        return this;
    }
    add_router(router) {
        for (const route of router.methods.get)this.methods.get[route.route] = route.handler;
        for (const route of router.methods.post)this.methods.post[route.route] = route.handler;
        for (const route of router.methods.patch)this.methods.patch[route.route] = route.handler;
        for (const route of router.methods.delete)this.methods.delete[route.route] = route.handler;
    }
    add_content_type(ext, content_type) {
        this.content_types.push({
            ext: content_type
        });
    }
    get({ route: route = this.current_route , handler: handler = ()=>{}  }) {
        this.methods.get[route] = handler;
        return this;
    }
    post({ route: route = this.current_route , handler: handler = ()=>{}  }) {
        this.methods.post[route] = handler;
        return this;
    }
    patch({ route: route = this.current_route , handler: handler = ()=>{}  }) {
        this.methods.patch[route] = handler;
        return this;
    }
    delete({ route: route = this.current_route , handler: handler = ()=>{}  }) {
        this.methods.delete[route] = handler;
        return this;
    }
    listen(message) {
        this.server.listen(this.port, this.host, ()=>{
            console.log(`${message} listening on port ${this.port}`);
        });
        return this.server;
    }
    static(dir_path) {
        this.static_dir = dir_path;
    }
    _read_file = (file_path)=>{
        return new Promise((resolve, reject)=>{
            $gSYnN$fs.readFile(file_path, (err, content)=>{
                if (err) reject(err);
                resolve(content);
            });
        });
    };
    _write_file = (file_path, data, flag = "w")=>{
        return new Promise((resolve, reject)=>{
            $gSYnN$fs.writeFile(file_path, data, {
                flag: flag
            }, (err)=>{
                if (err) reject(err);
                resolve("ok");
            });
        });
    };
    _search_file(dir, target_file_name) {
        for (const file of $gSYnN$fs.readdirSync(dir)){
            const full_path = $gSYnN$path.join(dir, file);
            if ($gSYnN$fs.lstatSync(full_path).isDirectory()) this._search_file(full_path, target_file_name);
            else if ($gSYnN$path.basename(full_path) === target_file_name) {
                this.found_file_path = full_path;
                break;
            }
        }
    }
}
const $9b6a791bf3448f12$var$reply_response = (res, status, content, content_type = "text/html")=>{
    return new Promise((resolve, reject)=>{
        res.setHeader("Content-Type", content_type).writeHead(status).end(content);
        resolve();
    });
};
const $9b6a791bf3448f12$var$get_query_str = (req)=>{
    return decodeURI(req.url).split("?")[1];
};
const $9b6a791bf3448f12$var$get_query_obj = (query_string)=>{
    if (query_string === undefined) return {};
    const query_string_pieces = query_string.split("&");
    const decoded_query_string = {};
    for (const piece of query_string_pieces){
        const [key, value] = piece.split("=");
        let data = null;
        try {
            const obj_str = '{"' + key + '"' + ":" + value + "}";
            data = JSON.parse(obj_str);
        } catch (err) {
            const obj_str = '{"' + key + '"' + ":" + '"' + value + '"' + "}";
            data = JSON.parse(obj_str);
        }
    //lodash_set(decoded_query_string, key, data[key]);
    }
    return decoded_query_string;
};
const $9b6a791bf3448f12$var$find_object = (array_of_obj, obj_conditions)=>{
    const condition_keys = Object.keys(obj_conditions);
    return array_of_obj.filter((obj)=>{
        return condition_keys.every((key)=>obj[key] === obj_conditions[key]);
    });
};
const $9b6a791bf3448f12$var$send_404 = async (res, obj)=>{
    await $9b6a791bf3448f12$var$reply_response(res, 404, JSON.stringify(obj), "application/json");
};
const $9b6a791bf3448f12$var$get_body = (req)=>{
    let body = "";
    return new Promise((resolve, reject)=>{
        req.on("data", (chunk)=>{
            body += chunk.toString();
        }).on("end", ()=>{
            const parsed = JSON.parse(body);
            //body = Buffer.concat(body);
            resolve(JSON.parse(body));
        }).on("error", (err)=>{
            reject(err);
        });
    });
};
const $9b6a791bf3448f12$var$set_cookies = (res, cookies)=>{
    res.setHeader("Set-Cookie", cookies);
};
class $9b6a791bf3448f12$var$Router {
    constructor(){
        this.route = undefined;
        this.methods = {
            get: [],
            post: [],
            patch: [],
            delete: []
        };
    }
    set_route(route) {
        this.route = route;
        return this;
    }
    get(handler = ()=>{}) {
        this.methods.get.push({
            route: this.route,
            handler: handler
        });
        return this;
    }
    post(handler = ()=>{}) {
        this.methods.post.push({
            route: this.route,
            handler: handler
        });
        return this;
    }
    patch(handler = ()=>{}) {
        this.methods.patch.push({
            route: this.route,
            handler: handler
        });
        return this;
    }
    delete(handler = ()=>{}) {
        this.methods.delete.push({
            route: this.route,
            handler: handler
        });
        return this;
    }
}
module.exports = {
    HttpServer: $9b6a791bf3448f12$var$HttpServer,
    reply_response: $9b6a791bf3448f12$var$reply_response,
    get_query_str: $9b6a791bf3448f12$var$get_query_str,
    get_query_obj: $9b6a791bf3448f12$var$get_query_obj,
    get_body: $9b6a791bf3448f12$var$get_body,
    find_object: $9b6a791bf3448f12$var$find_object,
    send_404: $9b6a791bf3448f12$var$send_404,
    set_cookies: $9b6a791bf3448f12$var$set_cookies,
    global_error_emitter: $9b6a791bf3448f12$var$global_error_emitter,
    Router: $9b6a791bf3448f12$var$Router
};


//# sourceMappingURL=main.js.map
