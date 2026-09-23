import axios, { type AxiosInstance } from 'axios';
import { DomainError } from '@domain/errors';
import type { HttpAdapter, HttpRequestOptions } from './http-adapter';

interface AxiosAdapterOptions {
  baseURL: string;
  timeoutMs: number;
  params?: Record<string, string>;
}

export class AxiosAdapter implements HttpAdapter {
  private readonly client: AxiosInstance;

  constructor({ baseURL, timeoutMs, params }: AxiosAdapterOptions) {
    this.client = axios.create({ baseURL, timeout: timeoutMs, params });
  }

  async get<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    try {
      const { data } = await this.client.get<T>(url, options);
      return data;
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error; // let TanStack Query handle cancellations silently
      }
      throw new DomainError('NETWORK', `GET ${url} failed`, error);
    }
  }
}
