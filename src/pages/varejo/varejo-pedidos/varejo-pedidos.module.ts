import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {VarejoPedidosPage} from './varejo-pedidos';

@NgModule({
  declarations: [
    VarejoPedidosPage,
  ],
  imports: [
    IonicPageModule.forChild(VarejoPedidosPage),
  ],
})
export class VarejoPedidosPageModule {}
