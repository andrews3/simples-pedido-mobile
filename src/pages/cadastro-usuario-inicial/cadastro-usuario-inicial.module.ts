import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {CadastroUsuarioInicialPage} from './cadastro-usuario-inicial';

@NgModule({
  declarations: [
    CadastroUsuarioInicialPage,
  ],
  imports: [
    IonicPageModule.forChild(CadastroUsuarioInicialPage),
  ],
})
export class CadastroUsuarioInicialPageModule {}
