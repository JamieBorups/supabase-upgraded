
import React from 'react';
import InfoBox from './InfoBox';

const SalesGuide: React.FC = () => {
  return (
    <div>
      <h2>Marketplace: Your Business Simulator</h2>
      <p>
        The <code>Marketplace</code> module is a comprehensive, integrated <strong>micro-business simulator</strong> for artists and arts collectives. It provides a hands-on platform where you can learn and apply fundamental business principles directly within the context of your creative work. It’s not just about tracking numbers; it's about building financial literacy and entrepreneurial confidence.
      </p>
      <p>
        The entire module is designed around a core business feedback loop: <strong>Plan → Curate → Execute → Analyze</strong>. By following this workflow, you'll gain practical experience in inventory management, sales strategy, and financial reporting.
      </p>

      <h3>1. Plan: Master Inventory</h3>
      <p>
        Your journey begins in the <code>Master Inventory</code> tab. This is your complete catalog of all items you might sell or give away. Before you can sell anything, you must define it here.
      </p>
      <h4>Key Concepts:</h4>
      <ul>
        <li><strong>Cost & Sale Price:</strong> For each item, you track its <strong>Cost Price</strong> (what it cost you to make or acquire) and its <strong>Sale Price</strong>. This immediately introduces the fundamental concept of <strong>Profit Margin</strong> (Sale Price - Cost Price).</li>
        <li><strong>Stock Tracking:</strong> Use the "Track Stock" toggle to manage items with finite quantities (like limited-edition prints). For items like coffee or water where you might have a large supply, you can disable stock tracking.</li>
        <li><strong>Categories:</strong> Organize your items into categories (which you can manage in <code>Settings &gt; Sales & Inventory</code>) for better filtering and management. This helps in analyzing which types of products are most successful.</li>
      </ul>
       <InfoBox type="tip">
        <p><strong>Strategy Exercise:</strong> Use the Cost and Sale prices to experiment with pricing strategies. See how different price points affect your potential profit margin for each item before you ever put it on sale.</p>
      </InfoBox>

      <h3>2. Curate: Sale Sessions</h3>
      <p>
        A <code>Sale Session</code> is a container for a specific sales period or context. Instead of a single, endless stream of sales, you can create distinct sessions like "Saturday Market," "Online Fundraiser," or "Concert Merch Table." This allows you to analyze sales performance in a targeted way.
      </p>
      <h4>How to Use It:</h4>
      <ol>
        <li>Go to the <code>Sale Sessions</code> tab and click "Create New Sale".</li>
        <li>Give your session a name and link it to an Event, a Project, or mark it as a General sale.</li>
        <li>From the list, click "Enter Session" to open its dedicated dashboard.</li>
      </ol>
      <p>Inside the session dashboard, go to the <code>Session Inventory</code> tab. Here, you curate your product offering by adding items from your Master Inventory. This encourages you to think strategically: "What products are best suited for this specific market or event?"</p>

      <h3>3. Execute: Point of Sale (POS)</h3>
      <p>
        The <code>Point of Sale (POS)</code> tab within a session dashboard is your virtual cash register. It's a simple interface designed for quick transactions at a market or event.
      </p>
      <ul>
        <li>Click on items from your session inventory to add them to the cart.</li>
        <li>Adjust quantities or mark items as "Voucher" redemptions. The voucher feature is perfect for tracking promotional giveaways, complimentary items for sponsors, or drink tickets. When an item is marked as a voucher, its sale price is not added to the revenue, but its cost price is still tracked as a "Promotional Cost" in the session report.</li>
        <li>Click "Complete Sale" to log the transaction. The system automatically calculates taxes based on your settings and updates your reports.</li>
      </ul>

      <h3>4. Analyze: Reports & Logs</h3>
      <p>
        This is where the learning happens. After a session, review the data in the dashboard:
      </p>
      <ul>
        <li><strong>Sales Log:</strong> A detailed, chronological list of every single transaction for this session. Useful for auditing and record-keeping.</li>
        <li><strong>Session Report:</strong> A high-level financial summary. It automatically calculates your <strong>Actual Revenue</strong>, <strong>Cost of Goods Sold (COGS)</strong>, and most importantly, your <strong>Net Profit</strong>. It also shows which items sold the most, giving you clear data on what's working.</li>
      </ul>
      <InfoBox type="info">
        <p>The workflow completes the entrepreneurial feedback loop: you <strong>Plan</strong> (Master Inventory), you <strong>Curate</strong> (Session Inventory), you <strong>Execute</strong> (POS), and you <strong>Analyze</strong> (Sales Report). This cycle is the engine of all successful businesses, and the Marketplace module is your sandbox to practice and master it.</p>
      </InfoBox>
    </div>
  );
};

export default SalesGuide;
