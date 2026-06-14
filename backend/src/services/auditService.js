import { supabaseAdmin } from '../lib/supabase.js';

export const writeAuditLog = async ({
  actorId = null,
  actorRole = null,
  action,
  entityType = null,
  entityId = null,
  metadata = {},
  ipAddress = null
}) => {
  const { error } = await supabaseAdmin
    .schema('admin')
    .from('audit_logs')
    .insert({
      actor_id: actorId,
      actor_role: actorRole,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      ip_address: ipAddress
    });

  if (error && process.env.NODE_ENV !== 'production') {
    console.warn('Could not write audit log:', error.message);
  }
};
