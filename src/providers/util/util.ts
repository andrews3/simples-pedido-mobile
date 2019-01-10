import {Injectable} from '@angular/core';
import {AngularFireDatabase} from "angularfire2/database";
import {LoadingController, Platform, ToastController} from "ionic-angular";
import {Toast} from "@ionic-native/toast";

@Injectable()
export class UtilProvider {

  private listeners = [];
  private usuario;
  public isTablet;

  constructor(private angularFireDb: AngularFireDatabase,
              private toastCtrl: ToastController,
              private loadCtrl: LoadingController,
              private toast: Toast,
              private platform: Platform) {
    this.usuario = {
      lojas: []
    };
  }

  public getFirebase() {
    return this.angularFireDb.database.ref("shopping");
  }

  public getLojaAtacadoPath(shoppingId, lojaId){
    return this.getFirebase().child('shoppings').child(shoppingId).child('lojas').child(lojaId);
  }

  public mostraToast(mensagem, duracao?) {
    if (!duracao) {
      duracao = 3000;
    }
    if (this.platform.is('cordova')) {
      this.toast.showWithOptions({
        message: mensagem,
        duration: duracao,
        position: 'bottom',
        styling: {
          opacity: 50,
          backgroundColor: "#202020",
          cornerRadius: 8
        }
      }).subscribe();
    } else {
      this.toastCtrl.create({message: mensagem, duration: duracao}).present();
    }
  }

  public getLoad(mensagem?) {
    if (!mensagem) {
      mensagem = "Carregando...";
    }
    let load = this.loadCtrl.create({content: mensagem});
    load.present();
    return load;
  }

  public formataTelefone(telefone) {
    return telefone.replace(/[^0-9]/g, '');
  }

  public loadUsuario() {
    if (!window.localStorage.getItem('uid')) {
      setTimeout(() => {
        this.loadUsuario();
      }, 1000)
    } else {
      let refAdd = this.getFirebase().child('usuarios').child(window.localStorage.getItem('uid'));
      refAdd.on('child_added', snapshot => {
        if (snapshot.key === 'lojas') {
          this.usuario.lojas = this.getLojas(snapshot.val());
        } else {
          this.usuario[snapshot.key] = snapshot.val();
        }
      });
      this.listeners.push(refAdd);

      let refChange = this.getFirebase().child('usuarios').child(window.localStorage.getItem('uid'));
      refChange.on('child_changed', snapshot => {
        if (snapshot.key === 'lojas') {
          this.usuario.lojas = this.getLojas(snapshot.val());
        } else {
          this.usuario[snapshot.key] = snapshot.val();
          console.log(snapshot.val());
        }
      });
      this.listeners.push(refChange);

      let refRemove = this.getFirebase().child('usuarios').child(window.localStorage.getItem('uid'));
      refRemove.on('child_removed', snapshot => {
        if (snapshot.key === 'lojas') {
          this.usuario.lojas = [];
        } else {
          this.usuario[snapshot.key] = null;
        }
      });
      this.listeners.push(refRemove);
    }
  }

  public getUsuario() {
    return this.usuario;
  }

  public getLojas(snapLojas) {
    let lojas = [];
    for (let id in snapLojas) {
      lojas.push({
        lojaId: id,
        vendedorId: snapLojas[id]
      });
    }
    return lojas;
  }

  public removeListeners() {
    for (let listener of this.listeners) {
      listener.off();
    }
  }

  public getHora(timestamp) {
    let date = timestamp;
    date = new Date(date);
    let hora = date.getHours();
    let minutos = date.getMinutes();

    if (hora < 10) {
      hora = '0' + hora;
    }
    if (minutos < 10) {
      minutos = '0' + minutos;
    }
    return hora + ':' + minutos;
  }

  public getData(timestamp) {
    let date = timestamp;
    date = new Date(date);
    let dia = date.getDate();
    let mes = date.getMonth() + 1;
    let ano = date.getFullYear();

    if (dia < 10) {
      dia = '0' + dia;
    }
    if (mes < 10) {
      mes = '0' + mes;
    }
    return dia + '/' + mes + '/' + ano;
  }
}

