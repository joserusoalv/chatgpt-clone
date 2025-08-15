// Safe preload bridge (extend as needed)
import { contextBridge } from 'electron';
contextBridge.exposeInMainWorld('appInfo', { version: '0.1.0' });
