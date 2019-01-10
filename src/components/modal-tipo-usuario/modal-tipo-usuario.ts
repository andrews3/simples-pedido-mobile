import {Component} from '@angular/core';
import {ViewController} from "ionic-angular";

@Component({
  selector: 'modal-tipo-usuario',
  templateUrl: 'modal-tipo-usuario.html'
})
export class ModalTipoUsuarioComponent {

  constructor(private viewCtrl: ViewController) {
  }

  public fechaDialog(tipo) {
    this.viewCtrl.dismiss(tipo);
  }

}
