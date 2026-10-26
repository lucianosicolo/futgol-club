import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ClimaService } from './clima.service';

describe('ClimaService', () => {
  let service: ClimaService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ClimaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
