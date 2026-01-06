import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profilelist } from './profilelist';

describe('Profilelist', () => {
  let component: Profilelist;
  let fixture: ComponentFixture<Profilelist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profilelist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Profilelist);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
