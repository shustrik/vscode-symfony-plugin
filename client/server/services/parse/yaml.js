"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("../service");
const vscode_languageserver_1 = require("vscode-languageserver");
var parser = require('yamljs');
function parse(body, path, services) {
    var parsed = parser.parse(body);
    if (parsed && parsed.services && parsed.services instanceof Object) {
        let serviceLines = parseServiceLines(body, parsed.services);
        parseServices(services, parsed.services, serviceLines, path);
    }
    if (parsed && parsed.parameters && parsed.parameters instanceof Object) {
        services.addParameters(parsed.parameters);
    }
}
exports.parse = parse;
function parseServices(services, parsedLines, serviceLines, path) {
    let defaults = {};
    for (var key of Object.keys(services)) {
        if (key == '_defaults') {
            defaults = services[key];
            continue;
        }
        let service = services[key];
        if (key.charAt(key.length - 1) == "\\") {
            if (defaults['autoconfigure']) {
                let autoconfigure = new service_1.Autoconfigure(key, services['resource']);
                if (service['exclude']) {
                    autoconfigure.setExclude(service['exclude']);
                }
                if (service['public'] == false || (defaults['public'] == false && service['public'] != true)) {
                    autoconfigure.private();
                }
                if (service['tags']) {
                    autoconfigure.addTags(parseTags(service['tags']));
                }
                services.addAutoconfigure(autoconfigure);
            }
            continue;
        }
        if (service instanceof Object) {
            let position = vscode_languageserver_1.Position.create(0, 0);
            if (serviceLines[key]) {
                position = vscode_languageserver_1.Position.create(serviceLines[key], 0);
            }
            let className = service['class'] ? service['class'] : key;
            let parsedService = new service_1.Service(key, className, position, path);
            parsedService.addArguments(parseArguments(service['arguments']));
            parsedService.addTags(parseTags(service['tags']));
            services.addService(key, parsedService, path);
        }
    }
}
function parseTags(tags) {
    let result = {};
    if (!tags) {
        return result;
    }
    tags.forEach(tag => {
        result[tag['name']] = result[tag['name']] ? result[tag['name']] : new service_1.Tag(tag['name']);
        Object.keys(tag).forEach(attribute => {
            result[tag['name']].addAttribute(attribute, tag[attribute]);
        });
    });
    return result;
}
function parseArguments(serviceArguments) {
    let parsedArguments = new Array();
    if (!serviceArguments) {
        return [];
    }
    for (let arg of serviceArguments) {
        if (arg) {
            parsedArguments.push(createArgument(arg));
        }
    }
    return parsedArguments;
}
function createArgument(argument) {
    if (Array.isArray(argument)) {
        let args = [];
        for (var arg of argument) {
            args.push(createArgument(arg));
        }
        return new service_1.CollectionArgument(args);
    }
    if (typeof (argument) === "boolean") {
        return new service_1.ParameterArgument(argument);
    }
    if (argument.includes('@')) {
        return new service_1.ServiceArgument(argument.substring(1));
    }
    if ((argument.match(/%/g) || []).length == 2) {
        return new service_1.ParameterArgument(argument);
    }
    return new service_1.TextArgument(argument);
}
function parseServiceLines(body, services) {
    let lines = body.split('\n');
    let result = {};
    let servicesId = Object.keys(services);
    lines.forEach((line, number) => {
        let current = line.trim().substring(0, line.trim().length - 1);
        if (servicesId.indexOf(current) != -1) {
            result[current] = number;
        }
    });
    return result;
}
//# sourceMappingURL=yaml.js.map