import {NgModule} from '@angular/core';
import {ModalTipoUsuarioComponent} from './modal-tipo-usuario/modal-tipo-usuario';
import {AlertSolicitacaoEnviadaComponent} from './alert-solicitacao-enviada/alert-solicitacao-enviada';
import {PopoverMenuVarejoComponent} from './popover-menu-varejo/popover-menu-varejo';
import {ModalVisualizaFotoComponent} from './modal-visualiza-foto/modal-visualiza-foto';
import {ModalAdicionaProdutoComponent} from './modal-adiciona-produto/modal-adiciona-produto';
import {ModalFinalizaPedidoComponent} from './modal-finaliza-pedido/modal-finaliza-pedido';
import {ModalVisualizaPedidoComponent} from './modal-visualiza-pedido/modal-visualiza-pedido';

@NgModule({
	declarations: [ModalTipoUsuarioComponent,
    AlertSolicitacaoEnviadaComponent,
    PopoverMenuVarejoComponent,
    ModalVisualizaFotoComponent,
    ModalAdicionaProdutoComponent,
    ModalFinalizaPedidoComponent,
    ModalVisualizaPedidoComponent],
	imports: [],
	exports: [ModalTipoUsuarioComponent,
    AlertSolicitacaoEnviadaComponent,
    PopoverMenuVarejoComponent,
    ModalVisualizaFotoComponent,
    ModalAdicionaProdutoComponent,
    ModalFinalizaPedidoComponent,
    ModalVisualizaPedidoComponent]
})
export class ComponentsModule {}
