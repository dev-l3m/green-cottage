declare module 'ical.js' {
  interface ICALComponent {
    getAllSubcomponents(type: string): ICALComponent[];
    getFirstPropertyValue(name: string): string;
    updatePropertyWithValue(name: string, value: unknown): void;
    addSubcomponent(component: ICALComponent): void;
    toString(): string;
  }

  interface ICALEvent {
    startDate: { toJSDate(): Date };
    endDate: { toJSDate(): Date };
  }

  const ICAL: {
    parse(input: string): unknown;
    Component: {
      new (data: unknown): ICALComponent;
      new (type: string, props?: unknown[], components?: unknown[]): ICALComponent;
    };
    Event: new (component: ICALComponent) => ICALEvent;
    Time: {
      fromJSDate(date: Date, useUTC?: boolean): unknown;
    };
  };

  export default ICAL;
}
