import { Container } from 'inversify';
import { Component } from '../../constants/index.js';
import { DefaultOfferService } from './default-offer.service.js';
import { OfferController } from './offer.controller.js';
import { OfferModel, type OfferEntity } from './offer.entity.js';

import type { types } from '@typegoose/typegoose';
import type { IController } from '../../libs/rest/index.js';
import type { IOfferService } from './offer-service.interface.js';

export function createOfferContainer() {
  const offerContainer = new Container();
  offerContainer
    .bind<IOfferService>(Component.OfferService)
    .to(DefaultOfferService)
    .inSingletonScope();

  offerContainer
    .bind<types.ModelType<OfferEntity>>(Component.OfferModel)
    .toConstantValue(OfferModel);

  offerContainer
    .bind<IController>(Component.OfferController)
    .to(OfferController)
    .inSingletonScope();

  return offerContainer;
}
