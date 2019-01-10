import {Component} from '@angular/core';
import {ViewController} from "ionic-angular";

@Component({
  selector: 'alert-solicitacao-enviada',
  templateUrl: 'alert-solicitacao-enviada.html'
})
export class AlertSolicitacaoEnviadaComponent {

  constructor(private viewCtrl: ViewController) {
  }

  public fechaDialog() {
    this.viewCtrl.dismiss();
  }

}
