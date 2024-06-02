export const Component = {
  RestApplication: Symbol.for('RestApplication'),
  Logger: Symbol.for('Logger'),
  Config: Symbol.for('Config'),
  DatabaseClient: Symbol.for('DatabaseClient'),
  UserService: Symbol.for('UserService'),
  UserModel: Symbol.for('UserModel'),
  OfferService: Symbol.for('OfferService'),
  OfferModel: Symbol.for('OfferModel'),
  OfferController: Symbol.for('OfferController'),
  ComfortModel: Symbol.for('ComfortModel'),
  ComfortService: Symbol.for('ComfortService'),
  CityModel: Symbol.for('CityModel'),
  CityService: Symbol.for('CityService'),
  CommentModel: Symbol.for('CommentModel'),
  CommentService: Symbol.for('CommentService'),
  UserController: Symbol.for('UserController'),
  ExceptionFilter: Symbol.for('ExceptionFilter')
} as const;
