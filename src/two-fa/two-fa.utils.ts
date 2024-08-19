import { Injectable } from "@nestjs/common";
import * as crypto from 'crypto'

@Injectable()
export class TwoFaUtils {
    generateBackupCodes = (count = 10, length = 8): string[] => {
        let codes: string[] = [];
        for (let i = 0; i < count; i++) {
            let code = crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();
            // Ensuring uniqueness within the generated set
            if (!codes.includes(code)) {
                codes.push(code);
            } else {
                i--; // Regenerate this code if it's not unique
            }
        }
        return codes;
    }
}