
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button"; // Added if we want a manual decode button
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Code, CheckCircle, XCircle, AlertCircle, Clock, ShieldAlert } from "lucide-react";
import { DateTime } from 'luxon';
import { Badge } from '@/components/ui/badge';

interface DecodedJwtPart {
  [key: string]: any;
}

interface TimestampInfo {
  claim: string;
  unix: number;
  local: string;
  utc: string;
}

const JwtDebugger = () => {
  const [jwtInput, setJwtInput] = useState<string>('');
  const [decodedHeader, setDecodedHeader] = useState<DecodedJwtPart | null>(null);
  const [decodedPayload, setDecodedPayload] = useState<DecodedJwtPart | null>(null);
  const [timestampInfo, setTimestampInfo] = useState<TimestampInfo[]>([]);
  const [tokenStatus, setTokenStatus] = useState<{ text: string; variant: 'default' | 'destructive' | 'secondary' | 'outline'; icon: React.ReactNode } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decodeAndProcessJwt = useCallback(() => {
    setError(null);
    setDecodedHeader(null);
    setDecodedPayload(null);
    setTimestampInfo([]);
    setTokenStatus(null);

    if (!jwtInput.trim()) {
      return; // Do nothing if input is empty
    }

    try {
      const parts = jwtInput.split('.');
      if (parts.length !== 3) {
        setError('Invalid JWT structure. A JWT must have three parts separated by dots.');
        return;
      }

      const headerStr = Buffer.from(parts[0], 'base64url').toString('utf8');
      const payloadStr = Buffer.from(parts[1], 'base64url').toString('utf8');
      
      let header: DecodedJwtPart;
      let payload: DecodedJwtPart;

      try {
        header = JSON.parse(headerStr);
        setDecodedHeader(header);
      } catch (e) {
        setError('Failed to parse JWT header. It might not be valid JSON.');
        return;
      }

      try {
        payload = JSON.parse(payloadStr);
        setDecodedPayload(payload);
      } catch (e) {
        setError('Failed to parse JWT payload. It might not be valid JSON.');
        return;
      }
      
      // Process timestamps
      const timestamps: TimestampInfo[] = [];
      const now = DateTime.now();
      let isExpired = false;
      let isNotYetActive = false;
      let hasExp = false;
      let hasNbf = false;

      const claimsToProcess = ['exp', 'iat', 'nbf'];
      claimsToProcess.forEach(claim => {
        if (payload[claim] !== undefined && typeof payload[claim] === 'number') {
          const dt = DateTime.fromSeconds(payload[claim]);
          timestamps.push({
            claim: claim.toUpperCase(),
            unix: payload[claim],
            local: dt.toLocal().toFormat("DDDD, HH:mm:ss ZZZZ"),
            utc: dt.toUTC().toFormat("DDDD, HH:mm:ss 'UTC'"),
          });

          if (claim === 'exp') {
            hasExp = true;
            if (dt < now) isExpired = true;
          }
          if (claim === 'nbf') {
            hasNbf = true;
            if (dt > now) isNotYetActive = true;
          }
        }
      });
      setTimestampInfo(timestamps);

      // Determine token status
      if (isExpired) {
        setTokenStatus({ text: 'Token is EXPIRED', variant: 'destructive', icon: <XCircle className="h-4 w-4" /> });
      } else if (isNotYetActive) {
        setTokenStatus({ text: 'Token is NOT YET ACTIVE', variant: 'secondary', icon: <Clock className="h-4 w-4" /> });
      } else if (hasExp || hasNbf || timestamps.length > 0) { // Check if any relevant time claims exist
        setTokenStatus({ text: 'Token appears VALID based on time claims', variant: 'default', icon: <CheckCircle className="h-4 w-4" /> });
      } else {
        setTokenStatus({ text: 'Token has no standard time claims (exp/nbf)', variant: 'outline', icon: <AlertCircle className="h-4 w-4" /> });
      }

    } catch (e: any) {
      console.error("JWT processing error:", e);
      setError(`Error decoding JWT: ${e.message}. Ensure it's a valid Base64Url encoded JWT.`);
      setTokenStatus({ text: 'Invalid Token', variant: 'destructive', icon: <XCircle className="h-4 w-4" /> });
    }
  }, [jwtInput]);

  useEffect(() => {
    decodeAndProcessJwt();
  }, [jwtInput, decodeAndProcessJwt]);


  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <Code className="h-8 w-8 text-primary" /> JWT Debugger
          </CardTitle>
          <CardDescription className="text-md">
            Paste a JSON Web Token to decode its header and payload, inspect claims, and check its expiry status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="jwt-input">Paste JWT here</Label>
            <Textarea
              id="jwt-input"
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
              rows={5}
              className="font-mono text-sm"
            />
          </div>
          
          <Alert variant="destructive" className="bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300">
            <ShieldAlert className="h-4 w-4 !text-yellow-600 dark:!text-yellow-400" />
            <AlertTitle className="text-yellow-700 dark:text-yellow-300">Signature Not Verified</AlertTitle>
            <AlertDescription>
              This tool decodes the JWT content but does NOT verify its signature. Do not trust the content of a JWT without verifying its signature using the correct secret or public key.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {tokenStatus && !error && (
             <Badge variant={tokenStatus.variant} className="text-md px-3 py-1.5 flex items-center gap-2 w-fit mx-auto">
                {tokenStatus.icon}
                {tokenStatus.text}
            </Badge>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">Decoded Header</h3>
              {decodedHeader ? (
                <pre className="p-3 bg-muted rounded-md text-xs overflow-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(decodedHeader, null, 2)}
                </pre>
              ) : (
                 jwtInput.trim() && !error && <p className="text-sm text-muted-foreground">Processing header...</p>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">Decoded Payload</h3>
              {decodedPayload ? (
                <pre className="p-3 bg-muted rounded-md text-xs overflow-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(decodedPayload, null, 2)}
                </pre>
              ) : (
                jwtInput.trim() && !error && <p className="text-sm text-muted-foreground">Processing payload...</p>
              )}
            </div>
          </div>

          {timestampInfo.length > 0 && (
            <div className="space-y-3 pt-3 border-t">
              <h3 className="text-lg font-semibold text-primary">Timestamp Claims</h3>
              {timestampInfo.map(ts => (
                <div key={ts.claim} className="p-3 bg-muted/50 rounded-md text-sm">
                  <p><strong className="text-accent">{ts.claim}:</strong> {ts.unix}</p>
                  <p className="text-xs"><strong className="text-muted-foreground">Local:</strong> {ts.local}</p>
                  <p className="text-xs"><strong className="text-muted-foreground">UTC:</strong> {ts.utc}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>JWTs consist of three parts: Header, Payload, and Signature, separated by dots. This tool helps inspect the first two parts.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JwtDebugger;
