import InnerClass from './inner';

class Test {
	constructor() {
		this.fn = (b) => this.foo();
	}

	foo() {
		return 'foo';
	}
}