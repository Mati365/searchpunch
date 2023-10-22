export abstract class ValueObject<T> {
  constructor(readonly props: T) {}

  static of: <A>(props: A) => ValueObject<A>;

  unwrap() {
    return this.props;
  }

  bind<O>(fn: (props: T) => O): O {
    return fn(this.props);
  }

  extend(props: Partial<T>): this {
    return new (this.constructor as any)({
      ...this.props,
      ...props,
    });
  }

  map(fn: (props: T) => T): this {
    return new (this.constructor as any)(this.bind(fn));
  }
}
