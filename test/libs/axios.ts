import axios from 'axios';
import * as MockAdapter from 'axios-mock-adapter';

export const axiosMock = new MockAdapter(axios);