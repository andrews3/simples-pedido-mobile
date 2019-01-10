import {Component} from '@angular/core';
import {AlertController, App, ViewController} from "ionic-angular";
import {UtilProvider} from "../../providers/util/util";
import {LoginPage} from "../../pages/login/login";

@Component({
  selector: 'popover-menu-varejo',
  templateUrl: 'popover-menu-varejo.html'
})
export class PopoverMenuVarejoComponent {

  constructor(private alertCtrl: AlertController,
              private app: App,
              private util: UtilProvider,
              private viewCtrl: ViewController) {
  }

  public desconectar() {
    let alert = this.alertCtrl.create({
      title: "Desconectar",
      message: "Tem certeza que deseja desconectar? Assim que você sair, não receberá as notificações :(",
      buttons: [
        {
          text: "Cancelar"
        },
        {
          text: "Desconectar",
          handler: () => {
            this.util.removeListeners();
            window.localStorage.removeItem('uid');
            window.localStorage.removeItem('userTipo');
            this.viewCtrl.dismiss();
            this.app.getRootNav().setRoot(LoginPage);
          }
        }
      ]
    });
    alert.present();
  }
}
