import Router from './router'

export default interface Service {
  inject(router: Router): void
}
