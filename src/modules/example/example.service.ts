import { Injectable } from '@nestjs/common';

@Injectable()
export class ExampleService {
  getExampleData(): string {
    return 'This is example data';
  }
}