import {Component} from '@angular/core';
import {IonicPage, NavParams} from 'ionic-angular';
import {UtilProvider} from "../../providers/util/util";
import {AngularFireDatabase} from "angularfire2/database";

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  private firebase;
  public destinatario: any = {
    nome: ''
  };
  public mensagens = [];
  public mensagem = '';
  private refListener;

  constructor(public navParams: NavParams,
              private util: UtilProvider,
              private fire: AngularFireDatabase) {
    this.firebase = this.util.getFirebase();
    this.destinatario.destinatarioId = this.navParams.get('destinatarioId');
    if (this.destinatario.destinatarioId) {
      this.loadNomeDestinatario();
    }
    this.loadMensagens();
  }

  ionViewWillLeave() {
    this.refListener.off();
  }

  public enviaMensagem() {
    if (this.mensagem) {
      let mens = {
        texto: this.mensagem,
        tipo: 'texto',
        dono: window.localStorage.getItem('uid'),
        donoTipo: window.localStorage.getItem('userTipo'),
        pushId: this.fire.createPushId(),
        shoppingId: this.navParams.get('shoppingId'),
        lojaId: this.navParams.get('lojaId'),
        destinatarioId: this.destinatario.destinatarioId
      };
      this.mensagem = '';
      this.firebase.child("solicitacaoMensagem").push().set(mens).catch(erro => {
        console.log(erro);
      });
      this.mensagens.push(mens);
      this.scrollToBottom();
    }
  }

  private loadNomeDestinatario() {
    if (this.destinatario.destinatarioId) {
      this.firebase.child('usuarios').child(this.destinatario.destinatarioId).once('value').then(snap => {
        this.destinatario.nome = snap.val().nome;
      });
    } else {
      setTimeout(() => {
        this.loadNomeDestinatario();
      }, 500);
    }
  }

  public getNomeDestinatario() {
    if (this.destinatario && this.destinatario.nome) {
      return this.destinatario.nome;
    } else {
      return '';
    }
  }

  private loadMensagens() {
    if (this.getUserTipo() === 'cliente') {
      this.refListener = this.firebase.child('shoppings').child(this.navParams.get('shoppingId')).child('lojas').child(this.navParams.get('lojaId'))
        .child('chat').child(this.destinatario.destinatarioId).child(window.localStorage.getItem('uid'));
    } else if(this.getUserTipo() === 'vendedor') {
      this.refListener = this.firebase.child('shoppings').child(this.navParams.get('shoppingId')).child('lojas').child(this.navParams.get('lojaId'))
        .child('chat').child(window.localStorage.getItem('uid')).child(this.destinatario.destinatarioId);
    }
    this.refListener.on('child_added', snapshot => {
      this.pushMensagem(snapshot);
    })
  }

  private pushMensagem(datasnapshot) {
    let mensagem = datasnapshot.val();
    let i = this.getIndexMensagem(mensagem);
    if (i === null) {
      this.mensagens.push(mensagem);
      this.ordenaMensagens();
      this.scrollToBottom();
    } else {
      this.mensagens[i] = mensagem;
      this.ordenaMensagens();
    }

  }

  private getIndexMensagem(mensagem) {
    for (let i = 0; i < this.mensagens.length; i++) {
      if (this.mensagens[i].pushId === mensagem.pushId) {
        return i;
      }
    }
    return null;
  }

  private ordenaMensagens() {
    this.mensagens.sort(function (a, b) {
      return a.timestamp - b.timestamp
    })
  }

  private scrollToBottom() {
    setTimeout(() => {
      this.mensagens.sort((a, b) => {
        if (a.timestamp < b.timestamp)
          return -1;
        if (a.timestamp > b.timestamp)
          return 1;
        return 0;
      });
      let objDiv = document.getElementById("list");
      objDiv.scrollTop = objDiv.scrollHeight;
    }, 200);
  }

  public getUserTipo() {
    return window.localStorage.getItem('userTipo');
  }

  private getNotificacao() {
    // let nome, body;
    // if (this.userConectado.tipo === "admin") {
    //   nome = 'Atendente';
    // } else {
    //   nome = this.userConectado.nome;
    // }
    // if (tipo === 'texto') {
    //   body = nome + ": " + this.mensagem;
    // } else if (tipo === 'imagem') {
    //   body = nome + " enviou uma imagem";
    // } else if (tipo === 'arquivo') {
    //   body = nome + " enviou um arquivo";
    // }
    // return {
    //   data: {
    //     token: this.getUserToken(),
    //     id: this.userConectado.id
    //   },
    //   notification: {
    //     title: "IRPF",
    //     body: body,
    //     icon: 'iconnot',
    //     color: "#260031",
    //   }
    // };
  }

  public isMinhaMensagem(mensagem) {
    return mensagem.dono === window.localStorage.getItem('uid');
  }

  public isLastMensagemMine(mensagem) {
    let index = this.mensagens.indexOf(mensagem);
    if (index === 0) {
      return false;
    } else if (index !== -1) {
      if (this.mensagens[index - 1].dono === mensagem.dono) {
        return true;
      }
    }
    return false;
  }

  public getMensagemHora(lastMsg) {
    let date = lastMsg.timestamp;
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
}
