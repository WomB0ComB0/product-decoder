/**
 * Copyright 2025 Product Decoder
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

import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

interface TurboConfig {
  $schema?: string;
  tasks?: {
    [task: string]: {
      env?: string[];
      [key: string]: unknown;
    };
  };
  [key: string]: unknown;
}

/**
 * Recursively finds all .env.example files in the project
 */
async function findEnvExampleFiles(dir: string = process.cwd(), depth: number = 0): Promise<string[]> {
  if (depth > 10) return [];
  
  const files: string[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        // Recursively search subdirectories
        const subFiles = await findEnvExampleFiles(fullPath, depth + 1);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name === '.env.example') {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Could not read directory ${dir}:`, error);
  }
  
  return files;
}

/**
 * Parses environment variables from .env.example file
 */
async function parseEnvFile(filePath: string): Promise<string[]> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const envVars: string[] = [];
    
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      
      // Extract variable name (everything before the first =)
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex > 0) {
        const varName = trimmed.substring(0, equalIndex).trim();
        if (varName) {
          envVars.push(varName);
        }
      }
    }
    
    return envVars;
  } catch (error) {
    console.warn(`Could not parse env file ${filePath}:`, error);
    return [];
  }
}

/**
 * Reads and parses turbo.json
 */
async function readTurboConfig(turboPath: string): Promise<TurboConfig> {
  try {
    if (!existsSync(turboPath)) {
      return {
        $schema: "https://turbo.build/schema.json",
        tasks: {}
      };
    }
    
    const content = await readFile(turboPath, 'utf-8');
    return JSON.parse(content) as TurboConfig;
  } catch (error) {
    console.warn(`Could not read turbo.json: ${error}`);
    return {
      $schema: "https://turbo.build/schema.json",
      tasks: {}
    };
  }
}

/**
 * Updates turbo.json with environment variables
 */
async function updateTurboConfig(
  turboPath: string, 
  config: TurboConfig, 
  envVars: string[], 
  tasks: string[] = ['build', 'dev', 'start']
): Promise<void> {
  if (!config.tasks) {
    config.tasks = {};
  }
  
  // Sort environment variables for consistent output
  const sortedEnvVars = [...new Set(envVars)].sort();
  
  // Update each specified task
  for (const task of tasks) {
    if (!config.tasks[task]) {
      config.tasks[task] = {};
    }
    
    // Merge with existing env vars if they exist
    const existingEnvVars = config.tasks[task].env || [];
    const mergedEnvVars = [...new Set([...existingEnvVars, ...sortedEnvVars])].sort();
    
    config.tasks[task].env = mergedEnvVars;
  }
  
  // Write back to file with pretty formatting
  const jsonContent = JSON.stringify(config, null, 2);
  await writeFile(turboPath, jsonContent, 'utf-8');
}

/**
 * Main execution function
 */
async function main() {
  console.log('🔍 Scanning for .env.example files...');
  
  const envFiles = await findEnvExampleFiles();
  
  if (envFiles.length === 0) {
    console.log('❌ No .env.example files found');
    return;
  }
  
  console.log(`📁 Found ${envFiles.length} .env.example file(s):`);
  envFiles.forEach(file => console.log(`   - ${file}`));
  
  // Collect all environment variables
  const allEnvVars: string[] = [];
  const envVarsByFile: Record<string, string[]> = {};
  
  for (const envFile of envFiles) {
    const vars = await parseEnvFile(envFile);
    allEnvVars.push(...vars);
    envVarsByFile[envFile] = vars;
    
    console.log(`📋 ${envFile}: ${vars.length} variables`);
    vars.forEach(v => console.log(`   - ${v}`));
  }
  
  const uniqueEnvVars = [...new Set(allEnvVars)];
  console.log(`\n🔧 Total unique environment variables: ${uniqueEnvVars.length}`);
  
  // Update turbo.json
  const turboPath = join(process.cwd(), 'turbo.json');
  console.log(`📝 Updating turbo.json...`);
  
  const turboConfig = await readTurboConfig(turboPath);
  await updateTurboConfig(turboPath, turboConfig, uniqueEnvVars);
  
  console.log('✅ Successfully updated turbo.json with environment variables!');
  console.log('\n📋 Updated tasks with environment variables:');
  
  const tasks = ['build', 'dev', 'start'];
  for (const task of tasks) {
    if (turboConfig.tasks?.[task]?.env) {
      console.log(`   ${task}: ${turboConfig.tasks[task].env!.length} variables`);
    }
  }
  
  console.log('\n💡 Pro tip: Run this script after adding new environment variables to .env.example files');
}

// Execute the script
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}
