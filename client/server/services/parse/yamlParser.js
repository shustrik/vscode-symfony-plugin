"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("../service");
const vscode_languageserver_1 = require("vscode-languageserver");
const yml = require("yaml-js");
function parse(body, path, services) {
    try {
        let parsed = yml.load(body);
        if (parsed.services && parsed.services instanceof Object) {
            let serviceLines = parseServiceLines(body, parsed.services);
            services.addServices(parseServices(parsed.services, serviceLines, path), path);
        }
        if (parsed.parameters && parsed.parameters instanceof Object) {
            services.addParameters(parseParameters(parsed.parameters), path);
        }
    }
    catch (e) {
        console.log('error parse yaml:' + path);
    }
}
exports.parse = parse;
function parseServices(services, serviceLines, path) {
    let parsedServices = [];
    for (var key of Object.keys(services)) {
        let service = services[key];
        if (service instanceof Object) {
            let position = vscode_languageserver_1.Position.create(0, 0);
            if (serviceLines[key]) {
                position = vscode_languageserver_1.Position.create(serviceLines[key], 0);
            }
            let className = service['class'] ? service['class'] : key;
            let parsedService = new service_1.Service(key, className, position, path);
            parsedService.addArguments(parseArguments(service['arguments']));
            parsedService.addTags(parseTags(service['tags']));
            parsedServices.push(parsedService);
        }
    }
    return parsedServices;
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
function parseParameters(parameters) {
    return parameters;
}
function parseArguments(serviceArguments) {
    let parsedArguments = new Array();
    if (!serviceArguments) {
        return [];
    }
    for (let arg of serviceArguments) {
        parsedArguments.push(createArgument(arg));
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
//# sourceMappingURL=yamlParser.js.map