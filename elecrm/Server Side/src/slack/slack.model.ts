export class SlackUser {
    id: string;
    name: string;
    realName: string;
    email: string;
  
    constructor(id: string, name: string, realName: string, email: string) {
      this.id = id;
      this.name = name;
      this.realName = realName;
      this.email = this.resolveAlias(email); // Resolve alias at instantiation
    }
  
    // Alias mapping: Maps Slack-registered emails to database emails
    private aliasMapping: { [key: string]: string } = {
      "moeboggs@elevated.loans": "mboggs@elevated.loans",
      "ivan.mendoza.1023@gmail.com": "imendoza@elevated.loans", // Added alias for Ivan Mendoza
    };
  
    // Resolve email alias if applicable
    private resolveAlias(email: string): string {
      return this.aliasMapping[email] || email;
    }
  }
  