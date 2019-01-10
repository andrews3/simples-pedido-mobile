import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import {UtilProvider} from "../../providers/util/util";
import {AngularFireAuth} from "angularfire2/auth";
import {CadastroUsuarioInicialPage} from "../cadastro-usuario-inicial/cadastro-usuario-inicial";
import {VarejoSelecionaTabsPage} from "../varejo/varejo-seleciona-tabs/varejo-seleciona-tabs";
import {StatusBar} from "@ionic-native/status-bar";

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public credencial: any;

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private platform: Platform,
              private util: UtilProvider,
              private fireAuth: AngularFireAuth,
              private statusBar: StatusBar) {
    this.credencial = {};
    if (window.localStorage.getItem('lastEmail')) {
      this.credencial.email = window.localStorage.getItem('lastEmail');
    }
  }

  ionViewWillEnter() {
    this.statusBar.backgroundColorByHexString('#181818')
  }

  public fazLogin() {
    if (this.credencial.email && this.credencial.senha) {
      let load = this.util.getLoad("Conectando...");
      this.fireAuth.auth.signInWithEmailAndPassword(this.credencial.email, this.credencial.senha).then(response => {
        console.log(response.uid);
        if (response.uid) {
          window.localStorage.setItem('uid', response.uid);
          window.localStorage.setItem('lastEmail', this.credencial.email);
        }
        this.util.loadUsuario();
        this.verificaTipoUser(load);
      }).catch(erro => {
        if (erro.code === "auth/invalid-email") {
          this.util.mostraToast("Esse e-mail não é um e-mail válido :(");
        } else if (erro.code === "auth/network-request-failed") {
          this.util.mostraToast("É necessário uma conexão com a internet para entrar :(");
        } else {
          this.util.mostraToast("E-mail ou senha inválidos");
        }
        console.log(erro);
        load.dismiss();
      })
    } else {
      this.util.mostraToast("Digite o seu e-mail e senha!");
    }
  }

  public abreCadastro() {
    this.navCtrl.push(CadastroUsuarioInicialPage);
  }

  private verificaTipoUser(load) {
    if (!this.util.getUsuario().userTipo) {
      setTimeout(() => {
        this.verificaTipoUser(load);
      }, 300);
    } else {
      window.localStorage.setItem('userTipo', this.util.getUsuario().userTipo);
      this.statusBar.backgroundColorByHexString('#260031');
      if (this.util.getUsuario().userTipo === 'cliente') {
        load.dismiss();
        this.navCtrl.setRoot(VarejoSelecionaTabsPage);
      } else {
        //TODO: Vai pra pagina do atacado;
      }
    }
  }
}
