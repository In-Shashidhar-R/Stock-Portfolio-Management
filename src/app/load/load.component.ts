import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { cardio } from 'ldrs';

@Component({
  selector: 'app-load',
  templateUrl: './load.component.html',
  styleUrls: ['./load.component.scss']
})
export class LoadComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    cardio.register();

    setTimeout(() => {
      this.router.navigate(['index']); 
    }, 5000);
  }
}
