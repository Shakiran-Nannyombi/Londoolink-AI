from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


class AuditLogService:
    def __init__(self, db: Session):
        self.db = db

    async def log_token_retrieval(
        self,
        agent_name: str,
        auth0_sub: str,
        service_type: str,
        scope: str,
        success: bool,
    ) -> None:
        entry = AuditLog(
            agent_name=agent_name,
            auth0_sub=auth0_sub,
            event_type="token_retrieval",
            service_type=service_type,
            scope_used=scope,
            action_type=None,
            outcome="success" if success else "failure",
        )
        self.db.add(entry)
        self.db.commit()

    async def log_high_stakes_action(
        self,
        agent_name: str,
        auth0_sub: str,
        action_type: str,
        target_service: str,
        outcome: str,
    ) -> None:
        entry = AuditLog(
            agent_name=agent_name,
            auth0_sub=auth0_sub,
            event_type="high_stakes_action",
            service_type=target_service,
            scope_used=None,
            action_type=action_type,
            outcome=outcome,
        )
        self.db.add(entry)
        self.db.commit()

    async def get_recent_entries(self, auth0_sub: str, limit: int = 20) -> list:
        return (
            self.db.query(AuditLog)
            .filter(AuditLog.auth0_sub == auth0_sub)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
            .all()
        )
