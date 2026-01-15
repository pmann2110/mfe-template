'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Session as CoreSession } from '@repo/auth-core';

interface IframeRemoteProps {
  src: string;
  title: string;
  session: CoreSession | null;
  height?: string;
}

export function IframeRemote({ 
  src, 
  title, 
  session, 
  height = '600px' 
}: IframeRemoteProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const targetOrigin = useMemo(() => {
    try {
      return new URL(src).origin;
    } catch {
      return '*';
    }
  }, [src]);

  useEffect(() => {
    // Force iframe reload when session changes
    setIframeKey(prev => prev + 1);
  }, [session]);

  const postSessionToIframe = () => {
    if (!session) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;

    win.postMessage(
      {
        type: 'SHELL_SESSION',
        session,
      },
      targetOrigin,
    );
  };

  if (!session) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Not authenticated</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <iframe
        key={iframeKey}
        ref={iframeRef}
        src={src}
        title={title}
        width="100%"
        height={height}
        style={{ border: 'none', minHeight: height }}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms"
        onLoad={() => {
          // Send session as soon as the iframe document is ready.
          postSessionToIframe();
        }}
      />
    </div>
  );
}