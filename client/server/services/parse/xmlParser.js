"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("../service");
const vscode_languageserver_1 = require("vscode-languageserver");
const xml = require("xml-js");
function parse(body, path, services) {
    try {
        let parsed = xml.xml2js(body, { compact: true });
        if (parsed.container && parsed.container instanceof Object) {
            if (parsed.container.services) {
                services.addServices(parseServices(parsed.container.services, parseServiceLines(body), path), path);
            }
            if (parsed.container.parameters) {
                services.addParameters(parseParameters(parsed.container.parameters), path);
            }
        }
    }
    catch (e) {
        console.log(e);
        console.log('error parse xml:' + path);
    }
}
exports.parse = parse;
function parseTags(tag) {
    if (tag && '_attributes' in tag) {
        let attributes = tag['_attributes'];
        let serviceTag = new service_1.Tag(attributes['name']);
        let name = attributes['name'];
        Object.keys(attributes).forEach(attribute => {
            serviceTag.addAttribute(attribute, tag[attribute]);
        });
        return { name: serviceTag };
    }
    return {};
}
function parseServices(services, serviceLines, path) {
    let parsedServices = [];
    let pushService = function (service) {
        let attributes = service['_attributes'];
        let className = attributes['class'] ? attributes['class'] : attributes['id'];
        let position = vscode_languageserver_1.Position.create(0, 0);
        if (serviceLines[attributes['id']]) {
            position = vscode_languageserver_1.Position.create(serviceLines[attributes['id']], 0);
        }
        let parsedService = new service_1.Service(attributes['id'], className, position, path);
        parsedService.addArguments(parseArguments(service['argument']));
        parsedService.addTags(parseTags(service['tag']));
        parsedServices.push(parsedService);
    };
    if (!services.service.length && ("_attributes" in services.service)) {
        pushService(services.service);
    }
    if (services.service.length > 0) {
        services.service.forEach(service => {
            pushService(service);
        });
    }
    return parsedServices;
}
function parseParameters(parameters) {
    let parsedParameters = {};
    let pushParameter = function (parameter) {
        let attributes = parameter['_attributes'];
        parsedParameters[attributes['key']] = parameter['_text'];
    };
    if (!parameters.parameter.length && ("_attributes" in parameters.parameter)) {
        pushParameter(parameters.parameter);
    }
    if (parameters.parameter.length > 0) {
        parameters.parameter.forEach(parameter => {
            pushParameter(parameter);
        });
    }
    return parsedParameters;
}
function parseArguments(serviceArguments) {
    let parsedArguments = new Array();
    if (!serviceArguments) {
        return [];
    }
    if (!Array.isArray(serviceArguments)) {
        return [createArgument(serviceArguments)];
    }
    for (let key in serviceArguments) {
        parsedArguments.push(createArgument(serviceArguments[key]));
    }
    return parsedArguments;
}
function createArgument(argument) {
    if (!("_attributes" in argument)) {
        if (argument['_text'] && (argument['_text'].match(/%/g) || []).length == 2) {
            return new service_1.ParameterArgument(argument['_text']);
        }
        return new service_1.TextArgument(argument['_text']);
    }
    let attributes = argument['_attributes'];
    if (attributes['type'] == 'service') {
        return new service_1.ServiceArgument(attributes['id']);
    }
    if (attributes['type'] == 'collection') {
        let args = [];
        if (argument['argument'] && Array.isArray(argument['argument'])) {
            for (let key in argument['argument']) {
                args.push(createArgument(argument['argument'][key]));
            }
        }
        if (argument['argument'] && !Array.isArray(argument['argument'])) {
            args.push(createArgument(argument['argument']));
        }
        return new service_1.CollectionArgument(args);
    }
}
function parseServiceLines(body) {
    let lines = body.split('\n');
    let result = {};
    lines.forEach((line, number) => {
        var match = line.match(/<(\s)*service(\s)+(id|class)="([%?\w\.]+)"/);
        if (match) {
            result[match[4]] = number;
        }
    });
    return result;
}
//# sourceMappingURL=xmlParser.js.map