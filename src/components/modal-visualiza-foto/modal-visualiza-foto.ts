import {Component} from '@angular/core';
import {NavParams, ViewController} from "ionic-angular";

@Component({
  selector: 'modal-visualiza-foto',
  templateUrl: 'modal-visualiza-foto.html'
})
export class ModalVisualizaFotoComponent {

  foto: string;

  constructor(private params: NavParams,
              public viewCtrl: ViewController) {
    this.foto = this.params.get('foto');
  }

}
