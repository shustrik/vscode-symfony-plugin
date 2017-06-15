import { Services, Service, ServiceArgument, TextArgument, ParameterArgument, CollectionArgument, Argument } from '../service'
import * as xml from 'xml-js';
export function parse(body, services: Services) {
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
function parseServices(services) {
    let parsedServices = [];
    services.service.forEach(service => {
        let attributes = service['_attributes'];
        let parsedService = new Service(attributes['id'], attributes['class']);
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

function parseArguments(serviceArguments): Array<Argument> {
    let parsedArguments = new Array<Argument>();
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

function createArgument(argument): Argument {
    if (!("_attributes" in argument)) {
        if ((argument['_text'].match(/%/g) || []).length == 2) {
            return new ParameterArgument(argument['_text']);
        }
        return new TextArgument(argument['_text'])
    }
    let attributes = argument['_attributes'];
    if (attributes['type'] == 'service') {
        return new ServiceArgument(attributes['id']);
    }
    if (attributes['type'] == 'collection') {
        let args = []
        if (argument['argument']) {
            for (let key in argument['argument']) {
                args.push(createArgument(argument['argument'][key]));
            }
        }
        return new CollectionArgument(args);
    }
}