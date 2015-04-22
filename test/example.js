import InnerClass from './inner';

export class Test {

	constructor() {
		this.fn = (b) => this.foo();
		this.version = '%VERSION%';
	}

	foo() {
		return 'foo';
	}
}