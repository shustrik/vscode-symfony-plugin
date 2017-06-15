import { Services, Service, ServiceArgument, TextArgument, ParameterArgument, CollectionArgument, Argument } from '../service'
import * as yml from 'yaml-js';
export function parse(body, services: Services){
    let parsed = yml.load(body);
    if (parsed.services && parsed.services instanceof Object) {
        services.addServices(parseServices(parsed.services));
    }
    if (parsed.parameters && parsed.parameters instanceof Object) {
        services.addServices(parseParameters(parsed.parameters));
    }
}
 function parseServices(services) {
    let parsedServices = [];
    for (var key of Object.keys(services)) {
        let service = services[key];
        if (service instanceof Object) {
            let parsedService = new Service(key, service['class']);
            parsedService.addArguments(parseArguments(service['arguments']));
            parsedServices.push(parsedService);
        }
    }
    return parsedServices;
}
export function parseParameters(parameters) {
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