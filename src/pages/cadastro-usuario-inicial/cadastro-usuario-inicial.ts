import {Component} from '@angular/core';
import {IonicPage, ModalController, NavController} from 'ionic-angular';
import {ModalTipoUsuarioComponent} from "../../components/modal-tipo-usuario/modal-tipo-usuario";
import {UtilProvider} from "../../providers/util/util";
import {AngularFireAuth} from "angularfire2/auth";
import {AlertSolicitacaoEnviadaComponent} from "../../components/alert-solicitacao-enviada/alert-solicitacao-enviada";
import {VarejoSelecionaTabsPage} from "../varejo/varejo-seleciona-tabs/varejo-seleciona-tabs";

@IonicPage()
@Component({
  selector: 'page-cadastro-usuario-inicial',
  templateUrl: 'cadastro-usuario-inicial.html',
})
export class CadastroUsuarioInicialPage {

  public usuario: any;
  public senha2;
  private firebase;

  constructor(public navCtrl: NavController,
              private modalCtrl: ModalController,
              private util: UtilProvider,
              private angularAuth: AngularFireAuth) {
    this.usuario = {};
    this.firebase = this.util.getFirebase();
    let modal = this.modalCtrl.create(ModalTipoUsuarioComponent);
    modal.onDidDismiss(callback => {
      if (!callback) {
        this.navCtrl.pop();
      } else {
        this.usuario.userTipo = callback;
      }
    });
    modal.present();
  }

  public concluiCadastro() {
    if (this.validaDados()) {
      let load = this.util.getLoad("Validando Informações...");
      let telefone = this.util.formataTelefone(this.usuario.telefone);
      this.validaTelefone(telefone).then(result => {
        if (!result) {
          load.dismiss();
          return false;
        }
        this.angularAuth.auth.createUserWithEmailAndPassword(this.usuario.email, this.usuario.senha).then(response => {
          this.usuario.uid = response.uid;
          this.usuario.telefone = telefone;
          this.firebase.child("usuarios").child(response.uid).set(this.usuario);
          load.dismiss();
          this.util.mostraToast("Sua conta foi cadastrada com sucesso! :]");
          window.localStorage.setItem('uid', response.uid);
          this.util.loadUsuario();
          setTimeout(() => {
            if (this.usuario.userTipo === 'cliente') {
              this.navCtrl.setRoot(VarejoSelecionaTabsPage);
            } else if (this.usuario.userTipo === 'vendedor') {

            }
          }, 300);
        })
          .catch(erro => {
            console.log(erro);
            load.dismiss();
            if (erro.code === "auth/invalid-email") {
              this.util.mostraToast("Esse e-mail não é um e-mail válido :(");
            } else if (erro.code === "auth/email-already-in-use") {
              this.util.mostraToast("Esse e-mail já está cadastrado por outra conta");
            }
          });
      });
    }
  }

  public solicitaCadastro() {
    if (this.validaDados()) {
      let load = this.util.getLoad("Validando Informações...");
      let telefone = this.util.formataTelefone(this.usuario.telefone);
      this.validaTelefone(telefone).then(result => {
        if (!result) {
          load.dismiss();
          return false;
        }
        this.usuario.telefone = telefone;
        this.firebase.child("solicitacoesAtacado").push().set({
          usuario: this.usuario,
          data: new Date().getDate() + "/" + new Date().getMonth() + 1 + "/" + new Date().getFullYear()
        });
        load.dismiss();
        let modal = this.modalCtrl.create(AlertSolicitacaoEnviadaComponent);
        modal.onDidDismiss(() => {
          this.navCtrl.pop();
        });
        modal.present();
      });
    }
  }

  private validaTelefone(telefone): Promise<any> {
    return new Promise((resolve, reject) => {
      this.firebase.child("users").once('value').then(snapshot => {
        if (snapshot && snapshot.hasChildren()) {
          snapshot.forEach(user => {
            let u = user.val();
            if (u.telefone === telefone) {
              this.util.mostraToast("Esse telefone já está cadastrado :[");
              resolve(false);
            }
          });
        }
        resolve(true);
      })
        .catch(erro => {
          console.log(erro);
          console.log("Error");
          resolve(false);
        });
    });
  }

  private validaDados() {
    if (!this.usuario.nome) {
      this.util.mostraToast("Digite o seu nome");
      return false
    } else if (!this.usuario.email) {
      this.util.mostraToast("Digite o seu e-mail");
      return false
    } else if (!this.usuario.telefone || this.usuario.telefone.length < 15) {
      this.util.mostraToast("Digite o seu telefone com o dígito 9");
      return false
    } else if (this.usuario.userTipo != 'vendedor' && !this.usuario.nomeLoja) {
      this.util.mostraToast("Digite o nome da sua loja");
      return false
    } else if (!this.usuario.senha) {
      this.util.mostraToast("Digite sua senha");
      return false
    } else if (this.usuario.senha.length < 6) {
      this.util.mostraToast("A senha deve ter no mínimo 6 caracteres");
      return false
    } else if (!this.senha2) {
      this.util.mostraToast("Digite a sua senha novamente");
      return false
    } else if (this.usuario.senha != this.senha2) {
      this.util.mostraToast("As duas senhas são diferentes, digite a mesma senha nos campos");
      return false
    } else if (this.usuario.userTipo === 'solicitacao' && !this.usuario.nomeShopping) {
      this.util.mostraToast("Digite o nome do seu shopping");
      return false
    }
    return true;
  }
}
