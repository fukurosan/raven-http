type ParameterIndexMap = { slashIndex: number; parameterName: string }[];

export class RavenEndpoint {
  endpointUrl: string;
  regexp: RegExp;
  parameterIndexMap: ParameterIndexMap;

  constructor(endpointUrl: string) {
    this.endpointUrl = endpointUrl;
    this.regexp = this.getRegexp(endpointUrl);
    this.parameterIndexMap = this.getParameterIndexMap(endpointUrl);
  }

  private getRegexp(urlString: string): RegExp {
    let processedString = urlString
      .replace(/\*/g, ".*")
      .replace(/\/:.*\/$/g, "/.*/")
      .replace(/\/:.*$/g, "/.*");
    return new RegExp(`^${processedString}$`);
  }

  private getParameterIndexMap(urlString: string): ParameterIndexMap {
    const parameterIndexMap: ParameterIndexMap = [];
    urlString
      .split("/")
      .splice(1)
      .forEach((section, index) => {
        if (section.startsWith(":")) {
          parameterIndexMap.push({
            slashIndex: index,
            parameterName: section.replace(":", ""),
          });
        }
      });
    return parameterIndexMap;
  }

  evaluateUrlString(url: string): boolean {
    return this.regexp.test(url.split("?")[0]);
  }

  extractParameters(incomingUrl: string) {
    const parameters: { [key: string]: string } = {};
    const path = incomingUrl.split("?")[0];
    const slashIndexes = path
      .split("")
      .reduce((acc: number[], character: string, index) => {
        character === "/" && acc.push(index);
        return acc;
      }, []);
    this.parameterIndexMap.forEach((parameter) => {
      let section = path.slice(slashIndexes[parameter.slashIndex] + 1);
      const nextSlashIndex = section.indexOf("/");
      if (nextSlashIndex > 0) section = section.slice(0, nextSlashIndex);
      parameters[parameter.parameterName] = section;
    });
    return parameters;
  }
}
