/**
 * Copyright 2025 Mike Odnis
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";

import { SignIn } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FFF0D6" }}>
      <Card className="w-full max-w-md" style={{ backgroundColor: "transparent" }}>
        <CardContent>
            <SignIn
              appearance={{
                elements: {
                  card: {
                    // backgroundColor: "transparent",
                    boxShadow: "none",
                    border: "none",
                    padding: "10",
                    margin: "0",
                    width: "100%",
                    overflow: "visible",
                  },
                  
                  // Hide default headers
                  headerTitle: {
                    display: "none"
                  },
                  headerSubtitle: {
                    display: "none"
                  },
                  
                  // Style form container with proper constraints
                  formContainer: {
                    backgroundColor: "transparent",
                    padding: "0",
                    margin: "0",
                    width: "100%",
                    maxWidth: "100%"
                  },
                  
                  // Ensure root container doesn't overflow
                  rootBox: {
                    width: "100%",
                    maxWidth: "100%"
                  },
                
                // Style input fields
                formFieldInput: {
                  backgroundColor: "#FFF6E6",
                  borderColor: "#CE673A",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  fontSize: "14px",
                  width: "100%",
                  boxSizing: "border-box",
                  "&:focus": {
                    borderColor: "#5865F2",
                    boxShadow: "0 0 0 2px rgba(88, 101, 242, 0.1)",
                    outline: "none"
                  },
                  "&::placeholder": {
                    color: "#CE673A",
                    opacity: 0.7
                  }
                },
                
                // Style labels
                formFieldLabel: {
                  color: "#CE673A",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "8px"
                },
                
                // Style primary buttons (Sign In, Continue, etc.)
                formButtonPrimary: {
                  backgroundColor: "#5865F2",
                  borderRadius: "6px",
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  border: "none",
                  width: "100%",
                  boxSizing: "border-box",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#4752C4"
                  },
                  "&:focus": {
                    backgroundColor: "#4752C4",
                    boxShadow: "0 0 0 2px rgba(88, 101, 242, 0.3)",
                    outline: "none"
                  }
                },
                
                // Style social connection buttons
                socialButtonsBlockButton: {
                  backgroundColor: "#5865F2",
                  borderColor: "#5865F2",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderRadius: "6px",
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "white",
                  width: "100%",
                  boxSizing: "border-box",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#4752C4",
                    borderColor: "#4752C4"
                  },
                  "&:focus": {
                    backgroundColor: "#4752C4",
                    borderColor: "#4752C4",
                    outline: "none"
                  }
                },
                
                // Style social buttons container
                socialButtonsBlockButtonText: {
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "500"
                },
                
                // Style divider
                dividerLine: {
                  backgroundColor: "#CE673A",
                  opacity: 0.3
                },
                dividerText: {
                  color: "#CE673A",
                  fontSize: "14px"
                },
                
                // Style footer links
                footerActionLink: {
                  color: "#5865F2",
                  fontSize: "14px",
                  "&:hover": {
                    color: "#4752C4"
                  }
                },
                
                // Style footer text
                footerActionText: {
                  color: "#CE673A",
                  fontSize: "14px"
                },
                
                // Style error messages
                formFieldErrorText: {
                  color: "#DC2626",
                  fontSize: "12px",
                  marginTop: "4px"
                },
                
                // Style success messages
                formFieldSuccessText: {
                  color: "#059669",
                  fontSize: "12px",
                  marginTop: "4px"
                },
                
                // Style loading spinner
                spinner: {
                  color: "#5865F2"
                },
                
                // Style form field rows with consistent spacing
                formFieldRow: {
                  marginBottom: "20px",
                  width: "100%"
                },
                
                // Style the main form
                form: {
                  gap: "20px",
                  width: "100%"
                },
                
                // Style alternative methods
                alternativeMethods: {
                  marginTop: "20px"
                },
                
                // Style social buttons container
                socialButtonsBlockButtonArrow: {
                  display: "none"
                },
                
                // Ensure proper spacing for social buttons
                socialButtonsProviderIcon: {
                  marginRight: "8px"
                },
                
                // Style OTP input
                formFieldInputShowPasswordIcon: {
                  color: "#CE673A"
                }
              },
              
              // Override default variables
              variables: {
                colorPrimary: "#5865F2",
                colorText: "#CE673A",
                colorTextSecondary: "#CE673A",
                colorBackground: "#FFF6E6",
                colorInputBackground: "#FFF6E6",
                colorInputText: "#1F2937",
                borderRadius: "6px",
                spacingUnit: "1rem"
              }
            }}
            redirectUrl="/dashboard"
            routing="hash"
                      />
        </CardContent>
      </Card>
    </div>
  );
}