import { Services, Service, Tag, ServiceArgument, TextArgument, ParameterArgument, CollectionArgument, Argument, Autoconfigure } from '../service'
import { Position } from 'vscode-languageserver';
var parser = require('yamljs');
export function parse(body: string, path: string, services: Services) {
    try {
        var parsed= parser.parse(body);
        // let parsed = yml.load(body);
        if (parsed && parsed.services && parsed.services instanceof Object) {
            let serviceLines = parseServiceLines(body, parsed.services);
            services.addServices(parseServices(parsed.services, serviceLines, path), path);
        }
        if (parsed && parsed.parameters && parsed.parameters instanceof Object) {
            services.addParameters(parseParameters(parsed.parameters), path);
        }
    } catch (e) {
        console.log(e);
        console.log('error parse yaml:' + path);
    }
}
function parseServices(services: Services, serviceLines: { [id: string]: number }, path: string) {
    let parsedServices = [];
    let defaults = {};
    for (var key of Object.keys(services)) {
        if (key == '_defaults') {
            defaults = services[key];
            continue;
        }
        let service = services[key];
        if (key.charAt(key.length - 1) == "\\") {
            if (defaults['autoconfigure']) {
                let autoconfigure = new Autoconfigure(key, services['resource']);
                if (service['exclude']) {
                    autoconfigure.setExclude(service['exclude']);
                }
                if (service['public'] == false || (defaults['public'] == false && service['public'] != true)) {
                    autoconfigure.private();
                }
                if (service['tags']) {
                    autoconfigure.addTags(parseTags(service['tags']));
                }
            }
            continue;
        }
        if (service instanceof Object) {
            let position = Position.create(0, 0);
            if (serviceLines[key]) {
                position = Position.create(serviceLines[key], 0);
            }
            let className = service['class'] ? service['class'] : key;
            let parsedService = new Service(key, className, position, path);
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
    if(typeof(argument) === "boolean"){
        return new ParameterArgument(argument); 
    }
    if (argument.includes('@')) {
        return new ServiceArgument(argument.substring(1));
    }
    if ((argument.match(/%/g) || []).length == 2) {
        return new ParameterArgument(argument);
    }
    return new TextArgument(argument);
}

function parseServiceLines(body: string, services) {
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