interface LeadCapture {
  email: string;
  tool: string;
  timestamp: Date;
  source?: string;
}

export class LeadCaptureService {
  private static leads: LeadCapture[] = [];

  static async captureLead(email: string, tool: string, source?: string): Promise<{ success: boolean; message: string }> {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Check if email already exists for this tool
    const existingLead = this.leads.find(lead => lead.email === email && lead.tool === tool);
    if (existingLead) {
      return { success: false, message: 'Email already registered for this tool' };
    }

    // Save lead
    const lead: LeadCapture = {
      email,
      tool,
      timestamp: new Date(),
      source
    };

    this.leads.push(lead);

    // In a real implementation, you would save to database and send notification
    console.log(`New lead captured: ${email} for ${tool}`);

    return { success: true, message: 'Successfully subscribed! Check your email for results.' };
  }

  static async getLeads(tool?: string): Promise<LeadCapture[]> {
    if (tool) {
      return this.leads.filter(lead => lead.tool === tool);
    }
    return this.leads;
  }

  static async getLeadCount(tool?: string): Promise<number> {
    const leads = await this.getLeads(tool);
    return leads.length;
  }

  static generateUpgradeMessage(tool: string): string {
    const messages = {
      'website-crawler': 'Upgrade to Pro for unlimited pages, custom reports, and API access!',
      'backlink-checker': 'Get Pro for competitor analysis, historical data, and bulk checking!',
      'keyword-research': 'Unlock Pro for keyword difficulty analysis, SERP features, and export options!',
      'meta-tag-generator': 'Pro users get AI-powered suggestions, bulk generation, and custom templates!'
    };

    return messages[tool as keyof typeof messages] || 'Upgrade to Pro for advanced features and unlimited access!';
  }
}
