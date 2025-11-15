import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { WarningsService } from './warnings.service';
import { UsersService } from '../users/users.service';

import { Importancia } from '@prisma/alertas-client';


interface InventarioAlertaPayload {
  userId: number; 
  lojaId: number;
  titulo: string;
  descricao: string;
  importancia: Importancia; 
}

@Injectable()
export class AlertasListener {
  constructor(
    private alertasService: WarningsService,
    private usuariosService: UsersService,
  ) {}

  
  @OnEvent('inventario.alerta')
  async handleInventarioAlerta(payload: InventarioAlertaPayload) { 
    try {
      
      const usuariosDaLoja = await this.usuariosService.findByLojaId(
        payload.lojaId,
      );

      if (usuariosDaLoja.length === 0) {
        console.warn(`Alerta de inventário (Loja ${payload.lojaId}), mas nenhum usuário encontrado.`);
        return;
      }
      
      
      const novoAlerta = await this.alertasService.createAlertaSistema({
        titulo: payload.titulo,
        descricao: payload.descricao,
        importancia: payload.importancia,
        lojaId: payload.lojaId,
        criadorId: payload.userId, 
        criadorNome: 'Sistema (Ajuste de Inventário)',
      });

      
      await this.alertasService.associarAlertaAUsuarios(
        novoAlerta.id,
        usuariosDaLoja.map((u) => u.id),
      );
    } catch (error) {
       console.error('Falha ao processar evento de alerta de inventário:', error);
    }
  }
}