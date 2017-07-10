import { Services, Service, Tag, ServiceArgument, TextArgument, ParameterArgument, CollectionArgument, Argument } from '../service'
import * as yml from 'yaml-js';
export function parse(body: string, path: string, services: Services) {
    try {
        let parsed = yml.load(body);
        if (parsed.services && parsed.services instanceof Object) {
            services.addServices(parseServices(parsed.services), path);
        }
        if (parsed.parameters && parsed.parameters instanceof Object) {
            services.addParameters(parseParameters(parsed.parameters), path);
        }
    } catch (e) {
        console.log(e);
        console.log('error parse yaml:' + path);
    }
}
function parseServices(services) {
    let parsedServices = [];
    for (var key of Object.keys(services)) {
        let service = services[key];
        if (service instanceof Object) {
            let className = service['class'] ? service['class'] : key;
            let parsedService = new Service(key, className);
            parsedService.addArguments(parseArguments(service['arguments']));
            parsedService.addTags(parseTags(service['tags']));
            parsedServices.push(parsedService);
        }
    }
    return parsedServices;
}
function parseTags(tags: Array<{}>) {
    let result = {};
    if (!tags) {
        return result;
    }
    tags.forEach(tag => {
        result[tag['name']] = result[tag['name']] ? result[tag['name']] : new Tag(tag['name']);
        Object.keys(tag).forEach(attribute => {
            result[tag['name']].addAttribute(attribute, tag[attribute]);
        });

    });
    return result;
}
function parseParameters(parameters) {
    return parameters;
}

function parseArguments(serviceArguments): Array<Argument> {
    let parsedArguments = new Array<Argument>();
    if (!serviceArguments) {
        return [];
    }
    for (let arg of serviceArguments) {
        parsedArguments.push(createArgument(arg));
    }
    return parsedArguments;
}

function createArgument(argument): Argument {
    if (Array.isArray(argument)) {
        let args = []
        for (var arg of argument) {
            args.push(createArgument(arg));
        }
        return new CollectionArgument(args);
    }
    if (argument.includes('@')) {
        return new ServiceArgument(argument.substring(1));
    }
    if ((argument.match(/%/g) || []).length == 2) {
        return new ParameterArgument(argument);
    }
    return new TextArgument(argument);
}