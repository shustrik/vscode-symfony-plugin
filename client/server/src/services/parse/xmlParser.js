"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = require("../service");
const xml = require("xml-js");
function parse(body, services) {
    let parsed = xml.xml2js(body, { compact: true });
    if (parsed.container && parsed.container instanceof Object) {
        if (parsed.container.services) {
            services.addServices(parseServices(parsed.container.services));
        }
        if (parsed.container.parameters) {
            services.addParameters(parseParameters(parsed.container.parameters));
        }
    }
}
exports.parse = parse;
function parseServices(services) {
    let parsedServices = [];
    services.service.forEach(service => {
        let attributes = service['_attributes'];
        let className = attributes['class'] ? attributes['class'] : attributes['id'];
        let parsedService = new service_1.Service(attributes['id'], className);
        parsedService.addArguments(parseArguments(service['argument']));
        parsedServices.push(parsedService);
    });
    return parsedServices;
}
function parseParameters(parameters) {
    let parsedParameters = {};
    parameters.parameter.forEach(parameter => {
        let attributes = parameter['_attributes'];
        parsedParameters[attributes['key']] = parameter['_text'];
    });
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
        if ((argument['_text'].match(/%/g) || []).length == 2) {
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
        if (argument['argument']) {
            for (let key in argument['argument']) {
                args.push(createArgument(argument['argument'][key]));
            }
        }
        return new service_1.CollectionArgument(args);
    }
}
//# sourceMappingURL=xmlParser.js.map